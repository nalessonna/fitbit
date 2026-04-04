Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # セッション
      get    "/auth/google/callback", to: "sessions#create"
      delete "/sessions",             to: "sessions#destroy"

      namespace :me do
        get :calendar
        get :volume
        resource  :profile, only: [ :show, :update, :destroy ]
        resources :body_parts, only: [ :index, :create, :update, :destroy ] do
          member do
            get :volume
          end
          resources :exercises, only: [ :index, :create, :update, :destroy ]
        end
        resources :exercises, only: [] do
          member do
            get :one_rm_history
            get :volume
          end
          resources :workout_logs, param: :date, only: [ :show, :update, :destroy ]
        end
      end
    end
  end
end
