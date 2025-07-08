'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Mail, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface EmailLog {
  id: string;
  to: string[];
  from: string;
  subject: string;
  status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'delivery_delayed';
  created_at: string;
  resend_id?: string;
  html?: string;
  text?: string;
  error?: string;
  event_type: 'invoice_processed' | 'reimbursement_submitted' | 'reimbursement_status' | 'approval_required';
  related_id?: string;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    fetchEmails();
  }, []);

  useEffect(() => {
    // Remove any existing inbox theme styles
    const existingStyle = document.getElementById('inbox-theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    console.log('Inbox page theme changed to:', isDarkMode ? 'dark' : 'light');
    
    // Add CSS rules for current theme
    const style = document.createElement('style');
    style.id = 'inbox-theme-styles';
    style.textContent = `
      .inbox-container {
        background-color: ${isDarkMode ? '#000000' : '#ffffff'} !important;
      }
      .inbox-card {
        background-color: ${isDarkMode ? '#000000' : '#ffffff'} !important;
      }
      .inbox-grid {
        background-color: ${isDarkMode ? '#000000' : '#ffffff'} !important;
      }
      /* Override parent backgrounds */
      .inbox-container * {
        background-color: inherit;
      }
      /* Ensure the main content area doesn't override */
      .inbox-container > div {
        background-color: ${isDarkMode ? '#000000' : '#ffffff'} !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const styleToRemove = document.getElementById('inbox-theme-styles');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [isDarkMode]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/company/inbox');
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
        // Auto-select first email if none selected
        if (data.emails && data.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(data.emails[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'bounced':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'complained':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'delivery_delayed':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'bounced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'complained':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'delivery_delayed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.to.some(recipient => recipient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const openInResend = (resendId: string) => {
    if (resendId) {
      window.open(`https://resend.com/emails/${resendId}`, '_blank');
    }
  };

  // Enhanced email content processing for dark mode with black theme
  const processEmailContent = (html: string) => {
    if (!isDarkMode) return html;
    
    let processedHtml = html;
    
    // Replace inline styles with dark mode equivalents
    processedHtml = processedHtml
      // Text colors - more comprehensive
      .replace(/color:\s*#333333?[^;]*/gi, 'color: #ffffff')
      .replace(/color:\s*#495057[^;]*/gi, 'color: #f5f5f5')
      .replace(/color:\s*#6c757d[^;]*/gi, 'color: #e0e0e0')
      .replace(/color:\s*#1f2937[^;]*/gi, 'color: #ffffff')
      .replace(/color:\s*black[^;]*/gi, 'color: #ffffff')
      .replace(/color:\s*#000[^;]*/gi, 'color: #ffffff')
      .replace(/color:\s*#ffffff?[^;]*/gi, 'color: #ffffff')
      .replace(/color:\s*white[^;]*/gi, 'color: #ffffff')
      .replace(/color:\s*rgb\(255,\s*255,\s*255\)[^;]*/gi, 'color: #ffffff')
      .replace(/color:\s*rgb\(0,\s*0,\s*0\)[^;]*/gi, 'color: #ffffff')
      
      // Background colors - more comprehensive
      .replace(/background-color:\s*#f[8-9a-f][^;]*/gi, 'background-color: #1a1a1a')
      .replace(/background-color:\s*#e[5-9a-f][^;]*/gi, 'background-color: #2a2a2a')
      .replace(/background-color:\s*#d[0-9a-f][^;]*/gi, 'background-color: #1a1a1a')
      .replace(/background-color:\s*#c[0-9a-f][^;]*/gi, 'background-color: #1a1a1a')
      .replace(/background-color:\s*white[^;]*/gi, 'background-color: #000000')
      .replace(/background-color:\s*#fff[^;]*/gi, 'background-color: #000000')
      .replace(/background-color:\s*#ffffff?[^;]*/gi, 'background-color: #000000')
      .replace(/background-color:\s*rgb\(255,\s*255,\s*255\)[^;]*/gi, 'background-color: #000000')
      .replace(/background-color:\s*rgb\(248,\s*249,\s*250\)[^;]*/gi, 'background-color: #1a1a1a')
      .replace(/background-color:\s*rgb\(241,\s*245,\s*249\)[^;]*/gi, 'background-color: #1a1a1a')
      
      // Background shorthand - more comprehensive
      .replace(/background:\s*#f[8-9a-f][^;]*/gi, 'background: #1a1a1a')
      .replace(/background:\s*#e[5-9a-f][^;]*/gi, 'background: #1a1a1a')
      .replace(/background:\s*#d[0-9a-f][^;]*/gi, 'background: #1a1a1a')
      .replace(/background:\s*#c[0-9a-f][^;]*/gi, 'background: #1a1a1a')
      .replace(/background:\s*white[^;]*/gi, 'background: #000000')
      .replace(/background:\s*#fff[^;]*/gi, 'background: #000000')
      .replace(/background:\s*#ffffff?[^;]*/gi, 'background: #000000')
      .replace(/background:\s*rgb\(255,\s*255,\s*255\)[^;]*/gi, 'background: #000000')
      .replace(/background:\s*rgb\(248,\s*249,\s*250\)[^;]*/gi, 'background: #1a1a1a')
      .replace(/background:\s*rgb\(241,\s*245,\s*249\)[^;]*/gi, 'background: #1a1a1a')
      
      // Gradients
      .replace(/background:\s*linear-gradient\([^)]*\)/gi, 'background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)')
      
      // Border colors
      .replace(/border-color:\s*#[de][^;]*/gi, 'border-color: #404040')
      .replace(/border:\s*1px solid #[de][^;]*/gi, 'border: 1px solid #404040')
      .replace(/border:\s*1px solid white[^;]*/gi, 'border: 1px solid #404040')
      .replace(/border:\s*1px solid #fff[^;]*/gi, 'border: 1px solid #404040')
      
      // Box shadows
      .replace(/box-shadow:[^;]*/gi, 'box-shadow: 0 1px 3px 0 rgba(255, 255, 255, 0.1)')
      
      // Make sure all text is visible by setting a base text color
      .replace(/<body[^>]*>/gi, '<body style="color: #ffffff; background-color: transparent;">')
      .replace(/<div[^>]*style="[^"]*"[^>]*>/gi, (match) => {
        if (!match.includes('color:')) {
          return match.replace('style="', 'style="color: #ffffff; ');
        }
        return match;
      })
      .replace(/<p[^>]*style="[^"]*"[^>]*>/gi, (match) => {
        if (!match.includes('color:')) {
          return match.replace('style="', 'style="color: #ffffff; ');
        }
        return match;
      })
      .replace(/<span[^>]*style="[^"]*"[^>]*>/gi, (match) => {
        if (!match.includes('color:')) {
          return match.replace('style="', 'style="color: #ffffff; ');
        }
        return match;
      })
      .replace(/<h[1-6][^>]*style="[^"]*"[^>]*>/gi, (match) => {
        if (!match.includes('color:')) {
          return match.replace('style="', 'style="color: #ffffff; ');
        }
        return match;
      })
      // Handle elements without style attributes
      .replace(/<p(?![^>]*style=)[^>]*>/gi, '<p style="color: #ffffff;">')
      .replace(/<span(?![^>]*style=)[^>]*>/gi, '<span style="color: #ffffff;">')
      .replace(/<div(?![^>]*style=)[^>]*>/gi, '<div style="color: #ffffff; background-color: transparent;">')
      .replace(/<h([1-6])(?![^>]*style=)[^>]*>/gi, '<h$1 style="color: #ffffff;">');
    
    // Wrap content to ensure visibility with important CSS and black theme
    return `
      <div style="color: #ffffff !important; background-color: transparent; padding: 0; margin: 0;">
        <style>
          * { 
            color: #ffffff !important; 
            background-color: transparent !important;
          }
          p, span, div, td, th, li { 
            color: #ffffff !important; 
            background-color: transparent !important;
          }
          h1, h2, h3, h4, h5, h6 { 
            color: #ffffff !important; 
            font-weight: bold; 
            background-color: transparent !important;
          }
          a { color: #60a5fa !important; }
          strong, b { color: #ffffff !important; font-weight: bold; }
          table { 
            border-collapse: collapse; 
            background-color: transparent !important;
          }
          td, th { 
            border: 1px solid #404040 !important; 
            padding: 8px; 
            background-color: transparent !important;
          }
          .card, .bg-white, .bg-gray-50, .bg-gray-100 {
            background-color: #1a1a1a !important;
          }
          [style*="background"] {
            background-color: transparent !important;
          }
        </style>
        ${processedHtml}
      </div>
    `;
  };

  return (
    <>
      <div 
        className="w-full min-h-screen bg-white dark:bg-black inbox-container"
        style={{ 
          backgroundColor: isDarkMode ? '#000000' : '#ffffff'
        }}
      >
        <div 
          className="container mx-auto p-6 bg-white dark:bg-black"
          style={{ 
            backgroundColor: isDarkMode ? '#000000' : '#ffffff'
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Inbox</h1>
              <p className="text-gray-600 dark:text-gray-300">Monitor all email notifications</p>
            </div>
            <Button onClick={fetchEmails} disabled={loading} className="dark:bg-black dark:text-white dark:hover:bg-gray-900 dark:border-gray-700">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div 
            className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)] bg-white dark:bg-black inbox-grid"
            style={{ 
              backgroundColor: isDarkMode ? '#000000' : '#ffffff'
            }}
          >
            {/* Email List - Narrower */}
            <div className="col-span-4">
              <Card 
                className="flex flex-col h-full border-gray-200 dark:border-gray-800 !bg-white dark:!bg-black inbox-card"
                style={{ 
                  backgroundColor: isDarkMode ? '#000000' : '#ffffff'
                }}
              >
                <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <CardTitle className="text-gray-900 dark:text-white">Emails ({filteredEmails.length})</CardTitle>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <div className="h-full overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-gray-500 dark:text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">Loading emails...</p>
                      </div>
                    ) : filteredEmails.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No emails found</p>
                      </div>
                    ) : (
                      filteredEmails.map((email) => (
                        <div
                          key={email.id}
                          onClick={() => setSelectedEmail(email)}
                          className={`p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors ${
                            selectedEmail?.id === email.id ? 'bg-blue-50 dark:bg-gray-800 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(email.status)}
                              <Badge className={`text-xs ${getStatusColor(email.status)}`}>
                                {email.status}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(email.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-sm mb-1 line-clamp-2 text-gray-900 dark:text-white">{email.subject}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 truncate">To: {email.to.join(', ')}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">From: {email.from}</p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Email Preview - Wider */}
            <div className="col-span-8">
              <Card 
                className="flex flex-col h-full border-gray-200 dark:border-gray-800 !bg-white dark:!bg-black inbox-card"
                style={{ 
                  backgroundColor: isDarkMode ? '#000000' : '#ffffff'
                }}
              >
                <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800">
                  <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                    <span>Preview</span>
                    {selectedEmail?.resend_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openInResend(selectedEmail.resend_id!)}
                        className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View in Resend
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  {selectedEmail ? (
                    <div className="h-full flex flex-col">
                      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(selectedEmail.status)}
                          <Badge className={`text-xs ${getStatusColor(selectedEmail.status)}`}>
                            {selectedEmail.status}
                          </Badge>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(selectedEmail.created_at).toLocaleString()}
                          </span>
                        </div>
                        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{selectedEmail.subject}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                          <p><strong>To:</strong> {selectedEmail.to.join(', ')}</p>
                          <p><strong>From:</strong> {selectedEmail.from}</p>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto">
                        {selectedEmail.html ? (
                          <div className={`border border-gray-200 dark:border-gray-800 rounded p-4 ${
                            isDarkMode ? 'bg-black' : 'bg-white'
                          }`}>
                            <div 
                              className={`prose prose-sm max-w-none ${
                                isDarkMode ? 'prose-invert' : ''
                              }`}
                              style={{
                                color: isDarkMode ? '#ffffff' : 'inherit',
                                backgroundColor: 'transparent'
                              }}
                              dangerouslySetInnerHTML={{ 
                                __html: processEmailContent(selectedEmail.html) 
                              }}
                            />
                          </div>
                        ) : selectedEmail.text ? (
                          <div className="border border-gray-200 dark:border-gray-800 rounded p-4 bg-gray-50 dark:bg-gray-900">
                            <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">{selectedEmail.text}</pre>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No content available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select an email to preview</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 