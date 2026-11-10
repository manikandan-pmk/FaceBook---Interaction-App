
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-950">Dashboard</h1>

        <p className="mt-1 text-sm text-zinc-500">Overview of your platform.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Total Admins", value: "12" },
          { title: "Total Students", value: "1,250" },
          { title: "Total Teachers", value: "85" },
          { title: "Total Courses", value: "32" },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-zinc-200 bg-white p-5"
          >
            <p className="text-sm text-zinc-500">{item.title}</p>

            <h2 className="mt-3 text-3xl font-bold text-zinc-950">
              {item.value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}
