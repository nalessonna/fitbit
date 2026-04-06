require "rails_helper"

RSpec.describe "Api::V1::Users::WorkoutLogs", type: :request do
  let(:user)     { create(:user) }
  let(:friend)   { create(:user) }
  let(:exercise) { create(:exercise, user: user) }

  describe "未認証の場合" do
    it "GET が401を返すこと" do
      get "/api/v1/users/#{user.account_id}/workout_logs/2026-04-01"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

    describe "GET /api/v1/users/:account_id/workout_logs/:date?exercise_id=" do
      it "指定日のセット一覧を返すこと" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-01")
        create(:workout_set, workout_log: log, set_number: 1, weight: 80.0, reps: 10)
        create(:workout_set, workout_log: log, set_number: 2, weight: 75.0, reps: 12)

        get "/api/v1/users/#{user.account_id}/workout_logs/2026-04-01", params: { exercise_id: exercise.id }

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["sets"].length).to eq(2)
        expect(body["sets"].first["weight"]).to eq(80.0)
      end

      it "記録がない日はsetsが空で返すこと" do
        get "/api/v1/users/#{user.account_id}/workout_logs/2026-04-01", params: { exercise_id: exercise.id }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["sets"]).to eq([])
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        get "/api/v1/users/#{user.account_id}/workout_logs/2026-04-01", params: { exercise_id: other_exercise.id }
        expect(response).to have_http_status(:not_found)
      end

      context "フレンドのワークアウトログを見る場合" do
        before { create(:friendship, requester: user, receiver: friend, status: "accepted") }

        it "フレンドのワークアウトログを返すこと" do
          friend_exercise = create(:exercise, user: friend)
          log = create(:workout_log, exercise: friend_exercise, date: "2026-04-01")
          create(:workout_set, workout_log: log, set_number: 1, weight: 80.0, reps: 10)

          get "/api/v1/users/#{friend.account_id}/workout_logs/2026-04-01", params: { exercise_id: friend_exercise.id }

          expect(response).to have_http_status(:ok)
          expect(response.parsed_body["sets"].first["weight"]).to eq(80.0)
        end
      end

      it "フレンドでないユーザーは403を返すこと" do
        stranger = create(:user)
        stranger_exercise = create(:exercise, user: stranger)
        get "/api/v1/users/#{stranger.account_id}/workout_logs/2026-04-01", params: { exercise_id: stranger_exercise.id }
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
