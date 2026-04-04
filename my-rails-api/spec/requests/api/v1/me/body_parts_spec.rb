require "rails_helper"

RSpec.describe "Api::V1::Me::BodyParts", type: :request do
  let(:user) { create(:user) }

  describe "GET /api/v1/me/body_parts" do
    context "未認証の場合" do
      it "401を返すこと" do
        get "/api/v1/me/body_parts"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

    describe "GET /api/v1/me/body_parts" do
      it "自分の部位一覧を返すこと" do
        my_parts = create_list(:body_part, 3, user: user)
        create(:body_part) # 他ユーザーの部位

        get "/api/v1/me/body_parts"

        expect(response).to have_http_status(:ok)
        ids = response.parsed_body.pluck("id")
        expect(ids).to match_array(my_parts.map(&:id))
      end
    end

    describe "POST /api/v1/me/body_parts" do
      it "部位を作成できること" do
        expect {
          post "/api/v1/me/body_parts", params: { body_part: { name: "臀部" } }
        }.to change(BodyPart, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(response.parsed_body["name"]).to eq("臀部")
      end

      it "nameが空の場合は422を返すこと" do
        post "/api/v1/me/body_parts", params: { body_part: { name: "" } }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "同じユーザーで重複するnameは422を返すこと" do
        create(:body_part, user: user, name: "胸")
        post "/api/v1/me/body_parts", params: { body_part: { name: "胸" } }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    describe "GET /api/v1/me/body_parts/:id/volume" do
      let(:body_part) { create(:body_part, user: user) }
      let(:exercise)  { create(:exercise, user: user, body_part: body_part) }

      it "部位別の日別ボリュームを返すこと" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-10")
        create(:workout_set, workout_log: log, weight: 80.0, reps: 10)

        get "/api/v1/me/body_parts/#{body_part.id}/volume"

        expect(response).to have_http_status(:ok)
        entry = response.parsed_body.find { |e| e["date"] == "2026-04-10" }
        expect(entry["volume"]).to eq(80.0 * 10)
      end

      it "他ユーザーの部位は404を返すこと" do
        other_part = create(:body_part)
        get "/api/v1/me/body_parts/#{other_part.id}/volume"
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "DELETE /api/v1/me/body_parts/:id" do
      let!(:body_part) { create(:body_part, user: user) }

      it "部位を削除できること" do
        expect {
          delete "/api/v1/me/body_parts/#{body_part.id}"
        }.to change(BodyPart, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "種目が紐づいている場合は422を返すこと" do
        create(:exercise, user: user, body_part: body_part)
        delete "/api/v1/me/body_parts/#{body_part.id}"
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "他ユーザーの部位は404を返すこと" do
        other_part = create(:body_part)
        delete "/api/v1/me/body_parts/#{other_part.id}"
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
