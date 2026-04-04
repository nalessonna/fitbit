require "rails_helper"

RSpec.describe "Api::V1::Me::Exercises", type: :request do
  let(:user)      { create(:user) }
  let(:body_part) { create(:body_part, user: user) }

  describe "未認証の場合" do
    it "GET /api/v1/me/body_parts/:body_part_id/exercises が401を返すこと" do
      get "/api/v1/me/body_parts/1/exercises"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

    describe "GET /api/v1/me/body_parts/:body_part_id/exercises" do
      it "指定部位の種目一覧を返すこと" do
        my_exercises = create_list(:exercise, 3, user: user, body_part: body_part)
        create(:exercise, user: user) # 別部位の種目

        get "/api/v1/me/body_parts/#{body_part.id}/exercises"

        expect(response).to have_http_status(:ok)
        ids = response.parsed_body.pluck("id")
        expect(ids).to match_array(my_exercises.map(&:id))
      end

      it "他ユーザーの部位は404を返すこと" do
        other_body_part = create(:body_part)
        get "/api/v1/me/body_parts/#{other_body_part.id}/exercises"
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "POST /api/v1/me/body_parts/:body_part_id/exercises" do
      it "種目を作成できること" do
        expect {
          post "/api/v1/me/body_parts/#{body_part.id}/exercises", params: { exercise: { name: "ベンチプレス" } }
        }.to change(Exercise, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.parsed_body["name"]).to eq("ベンチプレス")
        expect(response.parsed_body["body_part_id"]).to eq(body_part.id)
      end

      it "nameが空の場合は422を返すこと" do
        post "/api/v1/me/body_parts/#{body_part.id}/exercises", params: { exercise: { name: "" } }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "他ユーザーの部位は404を返すこと" do
        other_body_part = create(:body_part)
        post "/api/v1/me/body_parts/#{other_body_part.id}/exercises", params: { exercise: { name: "ベンチプレス" } }
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "PATCH /api/v1/me/body_parts/:body_part_id/exercises/:id" do
      let(:exercise) { create(:exercise, user: user, body_part: body_part) }

      it "種目を更新できること" do
        patch "/api/v1/me/body_parts/#{body_part.id}/exercises/#{exercise.id}", params: { exercise: { name: "更新後の種目" } }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["name"]).to eq("更新後の種目")
      end

      it "nameが空の場合は422を返すこと" do
        patch "/api/v1/me/body_parts/#{body_part.id}/exercises/#{exercise.id}", params: { exercise: { name: "" } }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        patch "/api/v1/me/body_parts/#{body_part.id}/exercises/#{other_exercise.id}", params: { exercise: { name: "更新" } }
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "DELETE /api/v1/me/body_parts/:body_part_id/exercises/:id" do
      let!(:exercise) { create(:exercise, user: user, body_part: body_part) }

      it "種目を削除できること" do
        expect {
          delete "/api/v1/me/body_parts/#{body_part.id}/exercises/#{exercise.id}"
        }.to change(Exercise, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        delete "/api/v1/me/body_parts/#{body_part.id}/exercises/#{other_exercise.id}"
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "GET /api/v1/me/exercises/:id/volume" do
      let(:exercise) { create(:exercise, user: user, body_part: body_part) }

      it "種目別の日別ボリュームを返すこと" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-10")
        create(:workout_set, workout_log: log, weight: 80.0, reps: 10)
        create(:workout_set, workout_log: log, weight: 60.0, reps: 12)

        get "/api/v1/me/exercises/#{exercise.id}/volume"

        expect(response).to have_http_status(:ok)
        entry = response.parsed_body.find { |e| e["date"] == "2026-04-10" }
        expect(entry["volume"]).to eq(80.0 * 10 + 60.0 * 12)
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        get "/api/v1/me/exercises/#{other_exercise.id}/volume"
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "GET /api/v1/me/exercises/:id/one_rm_history" do
      let(:exercise) { create(:exercise, user: user, body_part: body_part) }

      it "種目別の日別1RM履歴を返すこと" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-10")
        create(:workout_set, workout_log: log, weight: 100.0, reps: 5)

        get "/api/v1/me/exercises/#{exercise.id}/one_rm_history"

        expect(response).to have_http_status(:ok)
        entry = response.parsed_body.find { |e| e["date"] == "2026-04-10" }
        expect(entry["one_rm"]).to eq(100.0 * (1 + 5 / 30.0))
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        get "/api/v1/me/exercises/#{other_exercise.id}/one_rm_history"
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
