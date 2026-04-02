OmniAuth.config.test_mode = true

OmniAuth.config.mock_auth[:google] = OmniAuth::AuthHash.new(
  provider: "google",
  uid: "123456789",
  info: {
    email: "test@example.com",
    name: "テストユーザー",
    image: "https://example.com/avatar.jpg"
  }
)

RSpec.configure do |config|
  config.before(:each, type: :request) do
    Rails.application.env_config["omniauth.auth"] = OmniAuth.config.mock_auth[:google]
  end
end
