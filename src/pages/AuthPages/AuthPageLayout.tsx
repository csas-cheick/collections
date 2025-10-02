import React from "react";
import { Link } from "react-router"; 
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo"; 

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      <div 
        className="hidden lg:block lg:w-7/12 xl:w-8/12 bg-cover bg-center" 
        style={{ backgroundImage: "url('startup.svg')" }} 
      />
      <div className="relative flex flex-col flex-1 w-full lg:w-5/12 xl:w-4/12 bg-white dark:bg-gray-800 shadow-2xl">                
        <div className="flex justify-end p-4">
          <ThemeTogglerTwo /> 
        </div>
        <div className="flex flex-col flex-grow items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-xs text-center py-6 border-b border-gray-200 dark:border-gray-700 mb-6">
                <Link to="/" className="block">
                    <img 
                        width={200} 
                        height={80} 
                        src="images/logo/logo-auth.svg" 
                        alt="Logo"
                        className="mx-auto"
                    />
                </Link>
            </div>            
            {children}
        </div>        
        
        {/* Footer */}
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {/* Contenu du footer */}
        </div>
      </div>
    </div>
  );
}