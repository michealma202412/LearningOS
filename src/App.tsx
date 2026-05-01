import { Link, Route, Routes, useParams } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import { findLearningPage, findSubject, learningSubjects } from './data/learningData'
import { LearningPage } from './components/LearningPage'
import { SubjectPage } from './components/SubjectPage'
import { HomePage } from './components/HomePage'
import { NotFoundPage } from './components/NotFoundPage'

function SubjectRoute() {
  const { subject } = useParams()
  const subjectData = subject ? findSubject(subject) : undefined

  if (!subjectData) {
    return <NotFoundPage />
  }

  return <SubjectPage subject={subjectData} />
}

function LessonRoute() {
  const { subject, topic, page } = useParams()
  if (!subject || !topic || !page) {
    return <NotFoundPage />
  }

  const pageData = findLearningPage(subject, topic, page)
  if (!pageData) {
    return <NotFoundPage />
  }

  return <LearningPage page={pageData} />
}

export default function App() {
  const [showQR, setShowQR] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleShowQR = () => {
    setShowQR(true)
    // Generate QR code when modal opens
    setTimeout(() => {
      const currentUrl = window.location.href
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, currentUrl, {
          width: 250,
          margin: 2,
          color: {
            dark: '#ffffff',
            light: '#0f172a'
          }
        }, (error: Error | null) => {
          if (error) {
            console.error('QR code generation error:', error)
          }
        })

      }
    }, 100)
  }

  const handleCloseQR = () => {
    setShowQR(false)
  }

  return (
    <div className="app-shell">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div className="brand">
            <h1>Learning OS</h1>
          </div>
          <button 
            onClick={handleShowQR}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
          >
            📱 二维码
          </button>
        </div>
        <p style={{ margin: '0 0 1rem 0', opacity: 0.8 }}>扫码学习系统 · 轻量级学习操作系统</p>
        <nav className="top-nav">
          <Link to="/">首页</Link>
          <Link to="/learn/chinese">语文</Link>
          <Link to="/learn/math">数学</Link>
          <a href="http://192.168.0.104:5173/LearningOS/app/index.html" target="_blank" rel="noopener noreferrer" className="external-link">
            My account
          </a>
        </nav>
      </header>

      <main className="page-container">
        <Routes>
          <Route path="/" element={<HomePage subjects={learningSubjects} />} />
          <Route path="/learn/:subject" element={<SubjectRoute />} />
          <Route path="/learn/:subject/:topic/:page" element={<LessonRoute />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* QR Code Modal */}
      {showQR && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseQR}
        >
          <div 
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '1rem', color: '#475569' }}>📱 扫码访问当前页面</h3>
            <canvas 
              ref={canvasRef} 
              style={{ display: 'block', margin: '0 auto 1rem' }}
            />
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
              扫描二维码快速访问当前页面
            </p>
            <button
              onClick={handleCloseQR}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
