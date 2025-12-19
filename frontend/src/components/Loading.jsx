function Loading({ type = 'card', count = 6 }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(count)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[2/3] bg-tertiary rounded-lg skeleton" />
            <div className="mt-3 h-4 bg-tertiary rounded skeleton w-3/4" />
            <div className="mt-2 h-3 bg-tertiary rounded skeleton w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'hero') {
    return (
      <div className="h-[70vh] bg-tertiary skeleton animate-pulse" />
    );
  }

  if (type === 'detail') {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-tertiary skeleton" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 bg-tertiary rounded skeleton w-1/2 mb-4" />
          <div className="h-4 bg-tertiary rounded skeleton w-3/4 mb-2" />
          <div className="h-4 bg-tertiary rounded skeleton w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
    </div>
  );
}

export default Loading;
