
function Error404Page() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 h-full w-full">
            <h1 className="text-4xl text-destructive font-medium">404 Error</h1>
            <p className="text-2xl text-muted-foreground">Page not found</p>
        </div>
    )
}

export default Error404Page;