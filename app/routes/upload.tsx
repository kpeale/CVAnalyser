"use client"

import { type FormEvent, useState } from "react"
import Navbar from "~/components/Navbar"
import FileUploader from "~/components/FileUploader"
import { usePuterStore } from "~/lib/puter"
import { useNavigate } from "react-router"
import { convertPdfToImage } from "~/lib/pdf2img"
import { generateUUID } from "~/lib/utils"
import { prepareInstructions } from "../../constants"

// Mobile detection function
const isMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobileUserAgent = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const isSmallScreen = typeof window !== "undefined" && window.innerWidth <= 768
  return isMobileUserAgent || isSmallScreen
}

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelect = (file: File | null) => {
    setFile(file)
  }

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string
    jobTitle: string
    jobDescription: string
    file: File
  }) => {
    setIsProcessing(true)

    // Check if mobile device
    const isMobile = isMobileDevice()
    console.log("Is mobile device:", isMobile) // Debug log

    setStatusText("Uploading the file...")
    const uploadedFile = await fs.upload([file])
    if (!uploadedFile) return setStatusText("Error: Failed to upload file")

    let imagePath = ""

    // MOBILE: Skip PDF to image conversion completely
    if (isMobile) {
      console.log("Mobile detected - skipping PDF to image conversion") // Debug log
      setStatusText("Processing for mobile...")
      // Set imagePath to empty string for mobile
      imagePath = ""
    }
    // DESKTOP/LAPTOP: Do PDF to image conversion
    else {
      console.log("Desktop detected - converting PDF to image") // Debug log
      setStatusText("Converting to image...")
      const imageFile = await convertPdfToImage(file)
      if (!imageFile.file) return setStatusText("Error: Failed to convert PDF to image")

      setStatusText("Uploading the image...")
      const uploadedImage = await fs.upload([imageFile.file])
      if (!uploadedImage) return setStatusText("Error: Failed to upload image")

      imagePath = uploadedImage.path
    }

    setStatusText("Preparing data...")
    const uuid = generateUUID()
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: imagePath, // Will be empty string on mobile
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data))

    setStatusText("Analyzing...")
    const feedback = await ai.feedback(uploadedFile.path, prepareInstructions({ jobTitle, jobDescription }))

    if (!feedback) return setStatusText("Error: Failed to analyze resume")

    const feedbackText =
      typeof feedback.message.content === "string" ? feedback.message.content : feedback.message.content[0].text

    data.feedback = JSON.parse(feedbackText)
    await kv.set(`resume:${uuid}`, JSON.stringify(data))

    setStatusText("Analysis complete, redirecting...")
    console.log("Final data:", data) // Debug log
    navigate(`/resume/${uuid}`)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget.closest("form")
    if (!form) return

    const formData = new FormData(form)
    const companyName = formData.get("company-name") as string
    const jobTitle = formData.get("job-title") as string
    const jobDescription = formData.get("job-description") as string

    if (!file) return

    handleAnalyze({ companyName, jobTitle, jobDescription, file })
  }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

export default Upload
