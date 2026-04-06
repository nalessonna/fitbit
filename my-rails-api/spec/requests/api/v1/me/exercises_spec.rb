require "rails_helper"

RSpec.describe "Api::V1::Me::Exercises", type: :request do
  let(:user)      { create(:user) }
  let(:body_part) { create(:body_part, user: user) }

  describe "未認証の場合" do
    it "POST /api/v1/me/body_parts/:body_part_id/exercises が401を返すこと" do
      post "/api/v1/me/body_parts/1/exercises", params: { exercise: { name: "ベンチプレス" } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

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
  end
end
