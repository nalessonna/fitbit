Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      # セッション
      get    "/auth/google/callback", to: "sessions#create"
      delete "/sessions",             to: "sessions#destroy"

      # 読み取り共用: 自分 / フレンド どちらも account_id で統一
      scope '/users/:account_id', module: 'users', as: 'user' do
        get :calendar, to: 'users#calendar'
        get :volume,   to: 'users#volume'
        resources :body_parts, only: [ :index ] do
          member { get :volume }
          resources :exercises, only: [ :index ]
        end
        resources :exercises, only: [] do
          member do
            get :volume
            get :one_rm_history
          end
        end
        resources :workout_logs, param: :date, only: [ :show ]
      end

      # 書き込み: 自分のみ
      namespace :me do
        resource  :profile, only: [ :show, :update, :destroy ]
        resources :body_parts, only: [ :create, :update, :destroy ] do
          resources :exercises, only: [ :create, :update, :destroy ]
        end
        resources :workout_logs, param: :date, only: [ :update, :destroy ]
        resources :friendships, only: [ :create, :update, :destroy ] do
          collection do
            get :friends
            get :requests
          end
        end
      end

    end
  end
end
