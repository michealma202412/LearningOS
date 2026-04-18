import { Link, Route, Routes, useParams } from 'react-router-dom'
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
  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">
          <h1>Learning OS</h1>
          <p>扫码学习系统 · 轻量级学习操作系统</p>
        </div>
        <nav className="top-nav">
          <Link to="/">首页</Link>
          <Link to="/learn/chinese">语文</Link>
          <Link to="/learn/math">数学</Link>
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
    </div>
  )
}
