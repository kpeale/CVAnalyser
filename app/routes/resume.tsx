'use client';

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import ATS from '~/components/ATS';
import Details from '~/components/Details';
import Summary from '~/components/Summary';
import { usePuterStore } from '~/lib/puter';

interface Resume {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imagePath: string;
  resumePath: string;
  feedback: Feedback;
}

interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: {
      type: 'good' | 'improve';
      tip: string;
    }[];
  };
  toneAndStyle: {
    score: number;
    tips: {
      type: 'good' | 'improve';
      tip: string;
      explanation: string;
    }[];
  };
  content: {
    score: number;
    tips: {
      type: 'good' | 'improve';
      tip: string;
      explanation: string;
    }[];
  };
  structure: {
    score: number;
    tips: {
      type: 'good' | 'improve';
      tip: string;
      explanation: string;
    }[];
  };
  skills: {
    score: number;
    tips: {
      type: 'good' | 'improve';
      tip: string;
      explanation: string;
    }[];
  };
}

export const meta = () => [
  { title: 'Resumind | Review' },
  { name: 'description', content: 'Detailed overview of your resume' },
];

// Improved mobile detection - more specific to actual mobile devices
const isMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUserAgent =
    /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isSmallScreen =
    typeof window !== 'undefined' && window.innerWidth <= 640;

  // Only consider it mobile if BOTH conditions are true
  return isMobileUserAgent && isSmallScreen;
};

const Resume = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams<{ id: string }>();
  const [imageUrl, setImageUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated)
      navigate(`/auth?next=/resume/${id}`);
  }, [isLoading]);

  useEffect(() => {
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      if (!resume) return;

      const data = JSON.parse(resume);
      const resumeBlob = await fs.read(data.resumePath);
      if (!resumeBlob) return;

      const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
      const resumeUrl = URL.createObjectURL(pdfBlob);
      setResumeUrl(resumeUrl);

      // Try to load image if imagePath exists
      if (data.imagePath) {
        const imageBlob = await fs.read(data.imagePath);
        if (imageBlob) {
          const imageUrl = URL.createObjectURL(imageBlob);
          setImageUrl(imageUrl);
        }
      }

      setFeedback(data.feedback);
    };

    loadResume();
  }, [id]);

  return (
    <main className='!pt-0'>
      <nav className='resume-nav'>
        <Link
          to='/'
          className='back-button'
        >
          <img
            src='/icons/back.svg'
            alt='logo'
            className='w-2.5 h-2.5'
          />
          <span className='text-gray-800 text-sm font-semibold'>
            Back to Homepage
          </span>
        </Link>
      </nav>
      <div className='flex flex-row w-full max-lg:flex-col-reverse'>
        <section className='feedback-section  bg-[url("/images/bg-small.svg")] bg-cover h-[100vh] sticky top-0 items-center justify-center'>
          {/* Show image preview if imageUrl exists (for desktop/laptop uploads) */}
          {imageUrl && resumeUrl && (
            <div className='animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-2xl:h-fit w-fit'>
              <a
                href={resumeUrl}
                target='_blank'
                rel='noreferrer'
              >
                <img
                  src={imageUrl || '/placeholder.svg'}
                  alt='resume'
                  className='w-full h-full object-contain rounded-2xl'
                  title='resume'
                />
              </a>
            </div>
          )}
          {/* Show PDF directly on desktop when no image is available */}
          {!imageUrl && resumeUrl && !isMobile && (
            <div className='animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-2xl:h-fit w-full max-w-2xl'>
              <iframe
                src={resumeUrl}
                className='w-full h-full rounded-2xl'
                title='Resume PDF'
              />
            </div>
          )}
          {/* Show PDF link fallback ONLY on mobile when no image is available */}
          {!imageUrl && resumeUrl && isMobile && (
            <div className='animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-2xl:h-fit w-fit flex items-center justify-center p-8'>
              <div className='text-center'>
                <img
                  src='/images/pdf.png'
                  alt='pdf'
                  className='size-20 mx-auto mb-4'
                />
                <p className='text-gray-600 mb-4'>
                  Resume preview not available on mobile
                </p>
                <a
                  href={resumeUrl}
                  target='_blank'
                  className='primary-button inline-block'
                  rel='noreferrer'
                >
                  View PDF
                </a>
              </div>
            </div>
          )}
        </section>
        <section className='feedback-section'>
          <h2 className='text-4xl !text-black font-bold'>Resume Review</h2>
          {feedback ? (
            <div className='flex flex-col gap-8 animate-in fade-in duration-1000'>
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
              />
              <Details feedback={feedback} />
            </div>
          ) : (
            <img
              src='/images/resume-scan-2.gif'
              alt='resume'
              className='w-full'
            />
          )}
        </section>
      </div>
    </main>
  );
};

export default Resume;
