# API and Security Rules

- Preserve the existing `/api/metrics` routes unless a breaking change is explicitly requested.
- Use clear and consistent endpoint names.
- Return typed response models from FastAPI.
- Do not expose secrets, credentials, or environment values in source code.
- Do not use unrestricted CORS settings in a production configuration.
- Use environment-specific configuration for allowed origins.
- Validate date ranges, limits, filters, and numeric thresholds.
- Return meaningful HTTP errors when a request cannot be processed.
