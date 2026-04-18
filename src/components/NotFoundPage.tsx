import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section>
      <h2>页面未找到</h2>
      <p>请返回首页或选择一个学习章节。</p>
      <Link className="card" to="/">
        返回首页
      </Link>
    </section>
  )
}
