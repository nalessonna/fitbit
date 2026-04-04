require "rails_helper"

RSpec.describe "Api::V1::Me::Friendships", type: :request do
  let(:user)  { create(:user) }
  let(:other) { create(:user) }

  describe "未認証の場合" do
    it "GET /friendships/friends が401を返すこと" do
      get "/api/v1/me/friendships/friends"
      expect(response).to have_http_status(:unauthorized)
    end

    it "GET /friendships/requests が401を返すこと" do
      get "/api/v1/me/friendships/requests"
      expect(response).to have_http_status(:unauthorized)
    end

    it "POST /friendships が401を返すこと" do
      post "/api/v1/me/friendships"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

    describe "GET /api/v1/me/friendships/friends" do
      it "承認済みフレンド一覧を返すこと" do
        create(:friendship, requester: user, receiver: other, status: "accepted")
        create(:friendship, requester: user, status: "pending") # 申請中は含まない

        get "/api/v1/me/friendships/friends"

        expect(response).to have_http_status(:ok)
        ids = response.parsed_body.pluck("id")
        expect(ids).to include(other.id)
        expect(ids.length).to eq(1)
      end

      it "receiverとしてのフレンドも返すこと" do
        create(:friendship, requester: other, receiver: user, status: "accepted")

        get "/api/v1/me/friendships/friends"

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.pluck("id")).to include(other.id)
      end
    end

    describe "GET /api/v1/me/friendships/requests" do
      it "受け取った申請一覧を返すこと" do
        create(:friendship, requester: other, receiver: user, status: "pending")
        create(:friendship, requester: user, status: "pending") # 自分が送った申請は含まない

        get "/api/v1/me/friendships/requests"

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.length).to eq(1)
        expect(response.parsed_body.first["requester_id"]).to eq(other.id)
      end
    end

    describe "POST /api/v1/me/friendships" do
      it "フレンド申請を送れること" do
        expect {
          post "/api/v1/me/friendships", params: { account_id: other.account_id }
        }.to change(Friendship, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(Friendship.last.status).to eq("pending")
      end

      it "存在しないaccount_idは404を返すこと" do
        post "/api/v1/me/friendships", params: { account_id: "invalid" }
        expect(response).to have_http_status(:not_found)
      end

      it "自分自身への申請は422を返すこと" do
        post "/api/v1/me/friendships", params: { account_id: user.account_id }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "すでに申請済みの相手には422を返すこと" do
        create(:friendship, requester: user, receiver: other, status: "pending")
        post "/api/v1/me/friendships", params: { account_id: other.account_id }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "すでに申請を受けている相手には422を返すこと" do
        create(:friendship, requester: other, receiver: user, status: "pending")
        post "/api/v1/me/friendships", params: { account_id: other.account_id }
        expect(response).to have_http_status(:unprocessable_content)
      end
    end

    describe "PATCH /api/v1/me/friendships/:id" do
      let(:friendship) { create(:friendship, requester: other, receiver: user, status: "pending") }

      it "申請を承認できること" do
        patch "/api/v1/me/friendships/#{friendship.id}", params: { status: "accepted" }

        expect(response).to have_http_status(:ok)
        expect(friendship.reload.status).to eq("accepted")
      end

      it "無効なstatusは422を返すこと" do
        patch "/api/v1/me/friendships/#{friendship.id}", params: { status: "invalid" }
        expect(response).to have_http_status(:unprocessable_content)
      end

      it "自分が受け取った申請以外は404を返すこと" do
        other_friendship = create(:friendship, status: "pending")
        patch "/api/v1/me/friendships/#{other_friendship.id}", params: { status: "accepted" }
        expect(response).to have_http_status(:not_found)
      end
    end

    describe "DELETE /api/v1/me/friendships/:id" do
      it "フレンドを削除できること" do
        friendship = create(:friendship, requester: user, receiver: other, status: "accepted")

        expect {
          delete "/api/v1/me/friendships/#{friendship.id}"
        }.to change(Friendship, :count).by(-1)

        expect(response).to have_http_status(:no_content)
      end

      it "自分が関係しないfrienshipは404を返すこと" do
        other_friendship = create(:friendship)
        delete "/api/v1/me/friendships/#{other_friendship.id}"
        expect(response).to have_http_status(:not_found)
      end
    end
  end
end
