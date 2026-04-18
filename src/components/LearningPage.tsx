import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { LearningPage as LearningPageData } from '../data/learningData'

interface LearningPageProps {
  page: LearningPageData
}

export function LearningPage({ page }: LearningPageProps) {
  const [qrUrl, setQrUrl] = useState('')
  const pageRoute = `/learn/${page.subjectSlug}/${page.topicSlug}/${page.pageSlug}`

  useEffect(() => {
    const url = window.location.origin + pageRoute
    QRCode.toDataURL(url)
      .then(setQrUrl)
      .catch((error: unknown) => {
        console.error('QR code generation failed', error)
      })
  }, [pageRoute])

  return (
    <article>
      <h2>{page.title}</h2>
      <section className="card section-card">
        <h3>🎯 学习目标</h3>
        <ul>
          {page.goals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      </section>

      <section className="card section-card">
        <h3>📖 内容</h3>
        <p>{page.content}</p>
      </section>

      <section className="card section-card">
        <h3>🧠 记忆点</h3>
        <ul>
          {page.memoryPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="card section-card">
        <h3>❓ 小测试</h3>
        <ol>
          {page.quiz.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </section>

      <section className="card section-card">
        <h3>🔁 复习建议</h3>
        <ul>
          {page.reviewPlan.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="card section-card">
        <h3>QRCode 学习入口</h3>
        <p className="small-text">扫码或访问此链接进入本知识点：</p>
        <code>{window.location.origin + pageRoute}</code>
        {qrUrl ? <img alt="扫描进入学习单元" className="qr-image" src={qrUrl} /> : <p>正在生成二维码...</p>}
      </section>
    </article>
  )
}
