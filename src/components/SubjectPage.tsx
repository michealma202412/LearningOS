import { Link } from 'react-router-dom'
import type { SubjectData } from '../data/learningData'

interface SubjectPageProps {
  subject: SubjectData
}

export function SubjectPage({ subject }: SubjectPageProps) {
  return (
    <section>
      <h2>{subject.title}</h2>
      <p>下面是可扫码进入的学习主题和知识点。</p>
      {subject.topics.map((topic) => (
        <div key={topic.slug} className="topic-block">
          <h3>{topic.title}</h3>
          <div className="topic-list">
            {topic.pages.map((page) => (
              <Link
                key={page.pageSlug}
                className="card small"
                to={`/learn/${subject.slug}/${topic.slug}/${page.pageSlug}`}
              >
                <strong>{page.title}</strong>
                <span>进入学习单元</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
