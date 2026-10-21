import { NavLink } from "react-router-dom";
import { ChefHat, Leaf } from "lucide-react";
import { APP_NAME, NAV_ITEMS } from "@/constants/dashboard";

function AppSidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white sm:flex">
        <div className="flex h-full flex-col p-4">
          {/* Logo */}
          <NavLink to="/" className="mb-10 flex items-center gap-3 px-3 pt-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
              <Leaf className="size-6" />
            </div>

            <div>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {APP_NAME}
              </p>
              <p className="text-xs text-slate-400">Restaurant Intelligence</p>
            </div>
          </NavLink>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-1">
            <p className="mb-3 px-4 text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
              Workspace
            </p>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;

              if (!item.enabled) {
                return (
                  <div
                    key={item.path}
                    title="Coming soon"
                    className="flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400"
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-[10px] text-slate-300">
                      Soon
                    </span>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <Icon className="size-5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Restaurant profile */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-white text-emerald-700">
                <ChefHat className="size-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Riverside Grill
                </p>
                <p className="text-xs text-slate-500">Demo workspace</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed right-3 bottom-3 left-3 z-50 flex items-center justify-around rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-lg sm:hidden"
      >
        {NAV_ITEMS.filter((item) => item.enabled).map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex min-w-20 flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs ${
                  isActive ? "bg-emerald-50 text-emerald-800" : "text-slate-500"
                }`
              }
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <span className="px-3 text-[11px] text-slate-400">More pages soon</span>
      </nav>
    </>
  );
}

export default AppSidebar;
