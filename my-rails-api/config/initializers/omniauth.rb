OmniAuth.config.logger = Rails.logger
OmniAuth.config.allowed_request_methods = [ :get, :post ]

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2,
    ENV.fetch("GOOGLE_CLIENT_ID", ""),
    ENV.fetch("GOOGLE_CLIENT_SECRET", ""),
    scope: "email profile",
    path_prefix: "/api/v1/auth",
    callback_path: "/api/v1/auth/google/callback",
    name: "google"
end
