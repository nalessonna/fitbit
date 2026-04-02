Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # セッション（Google OAuthコールバック・ログアウト）
  get    "/api/v1/auth/google/callback", to: "api/v1/sessions#create"
  delete "/api/v1/sessions",             to: "api/v1/sessions#destroy"
end
