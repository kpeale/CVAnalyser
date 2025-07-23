'use client';

import { Link } from 'react-router';
import ScoreCircle from '~/components/ScoreCircle';
import { useEffect, useState } from 'react';
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

// Add mobile detection function
const isMobileDevice = () => {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    (typeof window !== 'undefined' && window.innerWidth <= 768)
  );
};

const ResumeCards = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
}: {
  resume: Resume;
}) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  useEffect(() => {
    const loadResume = async () => {
      // Only try to load image if imagePath exists and not on mobile
      if (imagePath && !isMobile) {
        const blob = await fs.read(imagePath);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setResumeUrl(url);
      }
    };

    loadResume();
  }, [imagePath, isMobile]);

  return (
    <Link
      to={`/resume/${id}`}
      className='resume-card animate-in fade-in duration-1000'
    >
      <div className='resume-card-header'>
        <div className='flex flex-col gap-2'>
          {companyName && (
            <h2 className='!text-black font-bold break-words'>{companyName}</h2>
          )}
          {jobTitle && (
            <h3 className='text-lg break-words text-gray-500'>{jobTitle}</h3>
          )}
          {!companyName && !jobTitle && (
            <h2 className='!text-black font-bold'>Resume</h2>
          )}
        </div>
        <div className='flex-shrink-0'>
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </div>
      {/* Show image preview only on desktop and if resumeUrl exists */}
      {!isMobile && resumeUrl && (
        <div className='gradient-border animate-in fade-in duration-1000'>
          <div className='w-full h-full'>
            <img
              src={resumeUrl || '/placeholder.svg'}
              alt='resume'
              className='w-full h-[350px] max-sm:h-[200px] object-cover object-top'
            />
          </div>
        </div>
      )}
      {/* Show placeholder on mobile */}
      {isMobile && (
        <div className='gradient-border animate-in fade-in duration-1000'>
          <div className='w-full h-[200px] flex items-center justify-center bg-gray-50'>
            <div className='text-center'>
              <img
                src='/images/pdf.png'
                alt='pdf'
                className='size-12 mx-auto mb-2'
              />
              <p className='text-gray-500 text-sm'>Resume</p>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

export default ResumeCards;
