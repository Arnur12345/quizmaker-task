import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  
  return (
    <Layout>
      <div className="min-h-screen w-full font-sans bg-white">
        {/* Hero section with gradient background */}
        <div className="relative overflow-hidden pt-8 pb-16 md:pb-24">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 z-0"></div>
          
          {/* Hero content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <div className="text-center mt-16 md:mt-24">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                The simplest way to create<br /> 
                <span className="text-blue-600">interactive quizzes</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
                Create engaging quizzes in minutes. Share with your audience. 
                Get real-time results.
              </p>
              
              {/* Email signup */}
              <div className="max-w-md mx-auto mb-8">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email" 
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Link to="/login" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                    Get started for free
                  </Link>
                </div>
                <p className="text-gray-500 text-sm mt-3">No credit card required. Start creating in seconds.</p>
              </div>
              
              {/* Features bullets */}
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mb-12">
                {["Unlimited quizzes", "Interactive elements", "Real-time analytics"].map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* App illustration */}
              <div id="demo" className="relative mx-auto max-w-5xl mt-12">
                {/* Shadow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10 h-12 bottom-0 left-0 right-0"></div>
                
                {/* App screenshot */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  {/* App header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="bg-white rounded-full px-4 py-1 text-sm text-gray-600 border border-gray-200">
                      quizmaker.app
                    </div>
                    <div className="w-16"></div>
                  </div>
                  
                  {/* App content */}
                  <div className="p-6">
                    <div className="text-center p-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Which planet is closest to the Sun?</h3>
                      <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                        {["Mercury", "Venus", "Earth", "Mars"].map((option, i) => (
                          <div key={i} className={`p-4 rounded-xl border-2 ${i === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'} cursor-pointer transition-colors`}>
                            {option}
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 max-w-sm mx-auto bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div id="info" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Create quizzes that people love</h2>
              <p className="mt-4 text-xl text-gray-600">Everything you need to engage your audience</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  title: "Easy to create",
                  description: "Build beautiful quizzes without any technical knowledge. Our intuitive editor makes it simple."
                },
                {
                  title: "Interactive elements",
                  description: "Add images, videos, and various question types to make your quizzes engaging and memorable."
                },
                {
                  title: "Detailed analytics",
                  description: "Get insights into how your audience is performing with comprehensive results and statistics."
                }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-2xl font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* CTA section */}
        <div id="start" className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to create your first quiz?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of educators and content creators who use QuizMaker to engage their audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
                Get started for free
              </Link>
              <button className="px-8 py-3 bg-white border border-gray-300 text-gray-800 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                See how it works
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}