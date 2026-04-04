require "rails_helper"

RSpec.describe "Api::V1::Me", type: :request do
  let(:user)      { create(:user) }
  let(:exercise)  { create(:exercise, user: user) }

  describe "未認証の場合" do
    it "GET /api/v1/me/calendar が401を返すこと" do
      get "/api/v1/me/calendar"
      expect(response).to have_http_status(:unauthorized)
    end

    it "GET /api/v1/me/volume が401を返すこと" do
      get "/api/v1/me/volume"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

    describe "GET /api/v1/me/calendar" do
      it "year/monthが未指定の場合は422を返すこと" do
        get "/api/v1/me/calendar"
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "指定月のトレーニング日と種目名を返すこと" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-10")
        create(:workout_log, exercise: exercise, date: "2026-03-10") # 別月
        create(:workout_log, date: "2026-04-10")                     # 他ユーザー

        get "/api/v1/me/calendar", params: { year: 2026, month: 4 }

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        expect(body.length).to eq(1)
        expect(body.first["date"]).to eq("2026-04-10")
        expect(body.first["exercise_names"]).to include(exercise.name)
      end

    end

    describe "GET /api/v1/me/volume" do
      it "日別の総ボリュームを返すこと" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-10")
        create(:workout_set, workout_log: log, weight: 80.0, reps: 10)
        create(:workout_set, workout_log: log, weight: 60.0, reps: 12)

        get "/api/v1/me/volume"

        expect(response).to have_http_status(:ok)
        body = response.parsed_body
        entry = body.find { |e| e["date"] == "2026-04-10" }
        expect(entry["volume"]).to eq(80.0 * 10 + 60.0 * 12)
      end

      it "period=monthで過去1ヶ月のデータのみ返すこと" do
        old_log = create(:workout_log, exercise: exercise, date: 2.months.ago.to_date)
        create(:workout_set, workout_log: old_log, weight: 100.0, reps: 5)
        recent_log = create(:workout_log, exercise: exercise, date: Date.today)
        create(:workout_set, workout_log: recent_log, weight: 80.0, reps: 10)

        get "/api/v1/me/volume", params: { period: "month" }

        body = response.parsed_body
        dates = body.map { |e| e["date"] }
        expect(dates).to include(Date.today.to_s)
        expect(dates).not_to include(old_log.date.to_s)
      end
    end
  end
end
