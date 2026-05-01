import { Link } from 'react-router-dom'
import type { SubjectData } from '../data/learningData'

interface HomePageProps {
  subjects: SubjectData[]
}

export function HomePage({ subjects }: HomePageProps) {
  return (
    <section>
      <h2>学习入口</h2>
      <p>选择一个学科开始扫码学习。</p>
      
      <div className="card-grid">
        {subjects.map((subject) => (
          <Link key={subject.slug} className="card" to={`/learn/${subject.slug}`}>
            <h3>{subject.title}</h3>
            <p>查看 {subject.title} 学习单元</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
