require "rails_helper"

RSpec.describe "Api::V1::Me::WorkoutLogs", type: :request do
  let(:user)     { create(:user) }
  let(:exercise) { create(:exercise, user: user) }

  describe "未認証の場合" do
    it "GET が401を返すこと" do
      get "/api/v1/me/exercises/1/workout_logs/2026-04-01"
      expect(response).to have_http_status(:unauthorized)
    end

    it "PUT が401を返すこと" do
      put "/api/v1/me/exercises/1/workout_logs/2026-04-01"
      expect(response).to have_http_status(:unauthorized)
    end

    it "DELETE が401を返すこと" do
      delete "/api/v1/me/exercises/1/workout_logs/2026-04-01"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

    describe "GET /api/v1/me/exercises/:exercise_id/workout_logs/:date" do
      it "指定日のセット一覧を返すこと" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-01")
        create(:workout_set, workout_log: log, set_number: 1, weight: 80.0, reps: 10)
        create(:workout_set, workout_log: log, set_number: 2, weight: 75.0, reps: 12)

        get "/api/v1/me/exercises/#{exercise.id}/workout_logs/2026-04-01"

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body["sets"].length).to eq(2)
        expect(body["sets"].first["weight"]).to eq(80.0)
      end

      it "記録がない日はsetsが空で返すこと" do
        get "/api/v1/me/exercises/#{exercise.id}/workout_logs/2026-04-01"

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["sets"]).to eq([])
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        get "/api/v1/me/exercises/#{other_exercise.id}/workout_logs/2026-04-01"
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "PUT /api/v1/me/exercises/:exercise_id/workout_logs/:date" do
      it "セットを保存できること" do
        expect {
          put "/api/v1/me/exercises/#{exercise.id}/workout_logs/2026-04-01",
              params: { sets: [ { set_number: 1, weight: 80.0, reps: 10 }, { set_number: 2, weight: 75.0, reps: 12 } ] }.to_json,
              headers: { "Content-Type" => "application/json" }
        }.to change(WorkoutLog, :count).by(1)

        expect(response).to have_http_status(:ok)
        expect(WorkoutSet.count).to eq(2)
      end

      it "既存セットを上書きできること" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-01")
        create(:workout_set, workout_log: log, set_number: 1, weight: 80.0, reps: 10)

        put "/api/v1/me/exercises/#{exercise.id}/workout_logs/2026-04-01",
            params: { sets: [ { set_number: 1, weight: 100.0, reps: 5 } ] }.to_json,
            headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:ok)
        expect(WorkoutSet.count).to eq(1)
        expect(WorkoutSet.first.weight).to eq(100.0)
      end

      it "setsが空の場合は422を返すこと" do
        put "/api/v1/me/exercises/#{exercise.id}/workout_logs/2026-04-01",
            params: { sets: [] }.to_json,
            headers: { "Content-Type" => "application/json" }

        expect(response).to have_http_status(:unprocessable_content)
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        put "/api/v1/me/exercises/#{other_exercise.id}/workout_logs/2026-04-01",
            params: { sets: [ { set_number: 1, weight: 80.0, reps: 10 } ] }.to_json,
            headers: { "Content-Type" => "application/json" }
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "DELETE /api/v1/me/exercises/:exercise_id/workout_logs/:date" do
      it "ワークアウトログを削除できること" do
        create(:workout_log, exercise: exercise, date: "2026-04-01")

        expect {
          delete "/api/v1/me/exercises/#{exercise.id}/workout_logs/2026-04-01"
        }.to change(WorkoutLog, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        delete "/api/v1/me/exercises/#{other_exercise.id}/workout_logs/2026-04-01"
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
