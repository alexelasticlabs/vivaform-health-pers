import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
        404
      </span>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        It looks like you followed an outdated link. Head back to the homepage and continue with VivaForm.
      </p>
      <div className="mt-4 flex gap-2">
        <Link to="/" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Go to homepage
        </Link>
        <Link to="/app" className="rounded-full border border-border px-4 py-2 text-sm font-semibold">
          Open the app
        </Link>
      </div>
    </div>
  );
};