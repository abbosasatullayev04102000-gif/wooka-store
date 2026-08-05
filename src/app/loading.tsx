export default function Loading() {
  return (
    <div className="container-page py-6">
      <div className="skeleton aspect-[16/7] rounded-2xl sm:aspect-[1000/320]" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
