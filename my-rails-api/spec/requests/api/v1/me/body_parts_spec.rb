require "rails_helper"

RSpec.describe "Api::V1::Me::BodyParts", type: :request do
  let(:user) { create(:user) }

  describe "未認証の場合" do
    it "POST /api/v1/me/body_parts が401を返すこと" do
      post "/api/v1/me/body_parts", params: { body_part: { name: "胸" } }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

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

    describe "PATCH /api/v1/me/body_parts/:id" do
      let!(:body_part) { create(:body_part, user: user) }

      it "部位名を更新できること" do
        patch "/api/v1/me/body_parts/#{body_part.id}", params: { body_part: { name: "更新後の部位" } }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body["name"]).to eq("更新後の部位")
      end

      it "nameが空の場合は422を返すこと" do
        patch "/api/v1/me/body_parts/#{body_part.id}", params: { body_part: { name: "" } }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "他ユーザーの部位は404を返すこと" do
        other_part = create(:body_part)
        patch "/api/v1/me/body_parts/#{other_part.id}", params: { body_part: { name: "更新" } }
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
