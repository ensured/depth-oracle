export function Footer() {
  return (
    <footer className="border-t dark:border-border/80 border-border bg-background/25 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-5">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2025 Depth Oracle. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="/docs/legal"
              className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/docs/terms"
              className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="/contact"
              className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
