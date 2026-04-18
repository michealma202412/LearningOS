export interface LearningPage {
  subjectSlug: string
  topicSlug: string
  pageSlug: string
  title: string
  goals: string[]
  content: string
  memoryPoints: string[]
  quiz: string[]
  reviewPlan: string[]
}

export interface TopicData {
  slug: string
  title: string
  pages: LearningPage[]
}

export interface SubjectData {
  slug: string
  title: string
  topics: TopicData[]
}

export const learningSubjects: SubjectData[] = [
  {
    slug: 'chinese',
    title: '语文',
    topics: [
      {
        slug: 'food-history',
        title: '食物历史',
        pages: [
          {
            subjectSlug: 'chinese',
            topicSlug: 'food-history',
            pageSlug: 'noodle',
            title: '面条的历史',
            goals: ['知道面条的起源', '了解中国饮食发展'],
            content:
              '面条起源于中国，已有4000多年历史。从最早的汤面到现代的快餐面，面条见证了饮食文化的演变。',
            memoryPoints: ['中国最早的面条', '4000多年历史'],
            quiz: ['面条起源于哪个国家？', '大约多少年前？'],
            reviewPlan: ['第1天：学习', '第3天：复习', '第7天：复习']
          }
        ]
      }
    ]
  },
  {
    slug: 'math',
    title: '数学',
    topics: [
      {
        slug: 'addition',
        title: '加法',
        pages: [
          {
            subjectSlug: 'math',
            topicSlug: 'addition',
            pageSlug: 'within-20',
            title: '20以内加法',
            goals: ['理解20以内的加法', '掌握基础运算技巧'],
            content:
              '20以内的加法是小学数学的重要基础。掌握加法可以帮助孩子更快理解算术和日常生活中的数量关系。',
            memoryPoints: ['加法符号是＋', '同位值位相加'],
            quiz: ['3 + 5 = ？', '7 + 8 = ？'],
            reviewPlan: ['第1天：学习', '第3天：复习', '第7天：复习']
          }
        ]
      }
    ]
  }
]

export function findSubject(slug: string) {
  return learningSubjects.find((subject) => subject.slug === slug)
}

export function findLearningPage(subjectSlug: string, topicSlug: string, pageSlug: string) {
  const subject = findSubject(subjectSlug)
  if (!subject) {
    return undefined
  }

  const topic = subject.topics.find((item) => item.slug === topicSlug)
  if (!topic) {
    return undefined
  }

  return topic.pages.find((page) => page.pageSlug === pageSlug)
}
