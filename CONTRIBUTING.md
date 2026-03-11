# Contributing to TaxGlue

Thank you for your interest in contributing to TaxGlue!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/taxglue.git`
3. Create a feature branch: `git checkout -b feature/my-feature`

## Development Setup

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase CLI (for local development)

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
# (for Vercel local development)
vercel dev

# Or run Python server
python server.py
```

## Code Style

- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

## Pull Request Process

1. Update documentation for any changes
2. Add tests if applicable
3. Ensure all tests pass
4. Update the CHANGELOG.md
5. Submit a pull request

## Commit Messages

Use clear, descriptive commit messages:
- `fix: resolve login issue`
- `feat: add export to Excel`
- `docs: update API documentation`

## Reporting Issues

Use GitHub Issues for bug reports and feature requests.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
