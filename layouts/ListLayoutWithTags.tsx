'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const lastSegment = segments[segments.length - 1]
  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, '') // Remove trailing slash
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-12 pb-8 md:space-y-5">
      <nav className="flex items-center justify-between gap-4">
        {!prevPage && (
          <button
            className="cursor-not-allowed px-4 py-2 text-gray-400 dark:text-gray-600"
            disabled={!prevPage}
          >
            ← Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
            className="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg px-4 py-2 font-medium transition-colors"
          >
            ← Previous
          </Link>
        )}
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button
            className="cursor-not-allowed px-4 py-2 text-gray-400 dark:text-gray-600"
            disabled={!nextPage}
          >
            Next →
          </button>
        )}
        {nextPage && (
          <Link
            href={`/${basePath}/page/${currentPage + 1}`}
            rel="next"
            className="text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 rounded-lg px-4 py-2 font-medium transition-colors"
          >
            Next →
          </Link>
        )}
      </nav>
    </div>
  )
}

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 border-b border-gray-200 pb-8 sm:mb-12 dark:border-gray-700">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl dark:text-white">
            {title}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {displayPosts.length} {displayPosts.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-4 lg:gap-12">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
              <h3 className="mb-6 text-sm font-bold tracking-wider text-gray-900 uppercase dark:text-white">
                Tags
              </h3>
              <nav className="space-y-1">
                {pathname.startsWith('/blog') ? (
                  <div className="bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg px-4 py-2.5 text-sm font-semibold">
                    All Posts
                  </div>
                ) : (
                  <Link
                    href={`/blog`}
                    className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  >
                    All Posts
                  </Link>
                )}
                {sortedTags.map((t) => {
                  const isActive = decodeURI(pathname.split('/tags/')[1]) === slug(t)
                  return (
                    <div key={t}>
                      {isActive ? (
                        <div className="bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg px-4 py-2.5 text-sm font-semibold">
                          {t} <span className="font-normal opacity-75">({tagCounts[t]})</span>
                        </div>
                      ) : (
                        <Link
                          href={`/tags/${slug(t)}`}
                          className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                          aria-label={`View posts tagged ${t}`}
                        >
                          {t} <span className="opacity-60">({tagCounts[t]})</span>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {displayPosts.map((post) => {
                const { path, date, title, summary, tags } = post
                return (
                  <article
                    key={path}
                    className="group border-b border-gray-200 pb-8 transition-all last:border-b-0 hover:pb-8 dark:border-gray-700"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <time
                          dateTime={date}
                          className="text-sm font-medium text-gray-500 dark:text-gray-400"
                        >
                          {formatDate(date, siteMetadata.locale)}
                        </time>
                        <span className="hidden text-gray-300 sm:inline dark:text-gray-600">•</span>
                        {tags && tags.length > 0 && (
                          <span className="hidden text-sm text-gray-500 sm:inline dark:text-gray-400">
                            {tags.length} {tags.length === 1 ? 'tag' : 'tags'}
                          </span>
                        )}
                      </div>
                      <h2 className="group-hover:text-primary-600 dark:group-hover:text-primary-400 text-2xl font-bold tracking-tight text-gray-900 transition-colors sm:text-3xl dark:text-white">
                        <Link href={`/${path}`} className="text-inherit">
                          {title}
                        </Link>
                      </h2>
                      <p className="line-clamp-2 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                        {summary}
                      </p>
                      {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {tags.map((tag) => (
                            <Tag key={tag} text={tag} />
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
