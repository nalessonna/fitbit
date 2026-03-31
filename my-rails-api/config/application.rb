require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "action_view/railtie"

Bundler.require(*Rails.groups)

module MyRailsApi
  class Application < Rails::Application
    config.load_defaults 8.1
    config.autoload_lib(ignore: %w[assets tasks])
    config.api_only = true

    # OmniAuthに必要なミドルウェア（API modeでは除外されているため手動追加）
    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore, key: "_fitlog_session"

    # CORS（Next.jsからのリクエストを許可）
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins ENV.fetch("FRONTEND_URL", "http://localhost:3000")
        resource "*",
          headers: :any,
          methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
          credentials: true
      end
    end
  end
end
