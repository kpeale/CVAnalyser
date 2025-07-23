'use client';

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';

export const meta = () => [
  { title: 'Resumind | Auth' },
  { name: 'description', content: 'Log into your account' },
];

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split('next=')[1];
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);
  }, [auth.isAuthenticated, next]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center px-4 py-8">
      <div className='gradient-border shadow-lg w-full max-w-md'>
        <section className='flex flex-col gap-8 bg-white rounded-2xl p-10 max-sm:p-6 max-sm:gap-6'>
          <div className='flex flex-col items-center gap-2 text-center'>
            <h1 className='max-sm:text-2xl'>Welcome</h1>
            <h2 className='max-sm:text-lg max-sm:leading-tight'>
              Log In to Continue Your Job Journey
            </h2>
          </div>
          <div>
            {isLoading ? (
              <button className='auth-button animate-pulse w-full'>
                <p>Signing you in ...</p>
              </button>
            ) : (
              <>
                {auth.isAuthenticated ? (
                  <button
                    className='auth-button w-full'
                    onClick={auth.signOut}
                  >
                    <p>Log out</p>
                  </button>
                ) : (
                  <button
                    className='auth-button w-full'
                    onClick={auth.signIn}
                  >
                    <p>Log in</p>
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Auth;
