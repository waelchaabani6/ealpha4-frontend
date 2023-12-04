import Button from '@component/button/button';
import RouteLayout from '@layout/routeLayout';

export default function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <RouteLayout>
      <div className="h-full w-full grid place-items-center">
        <div className="w-max h-max p-2 rounded-md">
          <p>Something went wrong:</p>
          <pre>{error.message}</pre>
          <Button type="button" variant="contained" onClick={resetErrorBoundary}>Try again</Button>
        </div>
      </div>
    </RouteLayout>
  );
}
