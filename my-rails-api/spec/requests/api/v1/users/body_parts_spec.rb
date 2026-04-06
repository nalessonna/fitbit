require "rails_helper"

RSpec.describe "Api::V1::Users::BodyParts", type: :request do
  let(:user)      { create(:user) }
  let(:friend)    { create(:user) }
  let(:body_part) { create(:body_part, user: user) }

  describe "未認証の場合" do
    it "GET /users/:account_id/body_parts が401を返すこと" do
      get "/api/v1/users/#{user.account_id}/body_parts"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

    describe "GET /api/v1/users/:account_id/body_parts" do
      it "自分の部位一覧を返すこと" do
        my_parts = create_list(:body_part, 3, user: user)
        create(:body_part) # 他ユーザーの部位

        get "/api/v1/users/#{user.account_id}/body_parts"

        expect(response).to have_http_status(:ok)
        ids = response.parsed_body.pluck("id")
        expect(ids).to match_array(my_parts.map(&:id))
      end

      context "フレンドの部位一覧を見る場合" do
        before { create(:friendship, requester: user, receiver: friend, status: "accepted") }

        it "フレンドの部位一覧を返すこと" do
          friend_parts = create_list(:body_part, 2, user: friend)

          get "/api/v1/users/#{friend.account_id}/body_parts"

          expect(response).to have_http_status(:ok)
          ids = response.parsed_body.pluck("id")
          expect(ids).to match_array(friend_parts.map(&:id))
        end
      end

      it "フレンドでないユーザーは403を返すこと" do
        stranger = create(:user)
        get "/api/v1/users/#{stranger.account_id}/body_parts"
        expect(response).to have_http_status(:forbidden)
      end
    end

    describe "GET /api/v1/users/:account_id/body_parts/:id/volume" do
      it "部位別の日別ボリュームを返すこと" do
        exercise = create(:exercise, user: user, body_part: body_part)
        log = create(:workout_log, exercise: exercise, date: "2026-04-10")
        create(:workout_set, workout_log: log, weight: 80.0, reps: 10)

        get "/api/v1/users/#{user.account_id}/body_parts/#{body_part.id}/volume"

        expect(response).to have_http_status(:ok)
        entry = response.parsed_body.find { |e| e["date"] == "2026-04-10" }
        expect(entry["volume"]).to eq(80.0 * 10)
      end

      context "フレンドの部位別ボリュームを見る場合" do
        before { create(:friendship, requester: user, receiver: friend, status: "accepted") }

        it "フレンドの部位別ボリュームを返すこと" do
          friend_part = create(:body_part, user: friend)
          exercise = create(:exercise, user: friend, body_part: friend_part)
          log = create(:workout_log, exercise: exercise, date: "2026-04-10")
          create(:workout_set, workout_log: log, weight: 80.0, reps: 10)

          get "/api/v1/users/#{friend.account_id}/body_parts/#{friend_part.id}/volume"

          expect(response).to have_http_status(:ok)
          entry = response.parsed_body.find { |e| e["date"] == "2026-04-10" }
          expect(entry["volume"]).to eq(80.0 * 10)
        end
      end

      it "他ユーザーの部位は404を返すこと" do
        other_part = create(:body_part)
        get "/api/v1/users/#{user.account_id}/body_parts/#{other_part.id}/volume"
        expect(response).to have_http_status(:not_found)
      end

      it "フレンドでないユーザーは403を返すこと" do
        stranger = create(:user)
        stranger_part = create(:body_part, user: stranger)
        get "/api/v1/users/#{stranger.account_id}/body_parts/#{stranger_part.id}/volume"
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
