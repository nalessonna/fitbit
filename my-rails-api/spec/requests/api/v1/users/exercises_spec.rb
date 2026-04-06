require "rails_helper"

RSpec.describe "Api::V1::Users::Exercises", type: :request do
  let(:user)      { create(:user) }
  let(:friend)    { create(:user) }
  let(:body_part) { create(:body_part, user: user) }

  describe "未認証の場合" do
    it "GET /users/:account_id/body_parts/:body_part_id/exercises が401を返すこと" do
      get "/api/v1/users/#{user.account_id}/body_parts/1/exercises"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  context "認証済みユーザーとして" do
    before { cookies[:auth_token] = JwtService.encode(user.id) }

    describe "GET /api/v1/users/:account_id/body_parts/:body_part_id/exercises" do
      it "指定部位の種目一覧を返すこと" do
        my_exercises = create_list(:exercise, 3, user: user, body_part: body_part)
        create(:exercise, user: user) # 別部位の種目

        get "/api/v1/users/#{user.account_id}/body_parts/#{body_part.id}/exercises"

        expect(response).to have_http_status(:ok)
        ids = response.parsed_body.pluck("id")
        expect(ids).to match_array(my_exercises.map(&:id))
      end

      context "フレンドの種目一覧を見る場合" do
        before { create(:friendship, requester: user, receiver: friend, status: "accepted") }

        it "フレンドの部位別種目一覧を返すこと" do
          friend_part = create(:body_part, user: friend)
          friend_exercises = create_list(:exercise, 2, user: friend, body_part: friend_part)

          get "/api/v1/users/#{friend.account_id}/body_parts/#{friend_part.id}/exercises"

          expect(response).to have_http_status(:ok)
          ids = response.parsed_body.pluck("id")
          expect(ids).to match_array(friend_exercises.map(&:id))
        end
      end

      it "他ユーザーの部位は404を返すこと" do
        other_body_part = create(:body_part)
        get "/api/v1/users/#{user.account_id}/body_parts/#{other_body_part.id}/exercises"
        expect(response).to have_http_status(:not_found)
      end

      it "フレンドでないユーザーは403を返すこと" do
        stranger = create(:user)
        stranger_part = create(:body_part, user: stranger)
        get "/api/v1/users/#{stranger.account_id}/body_parts/#{stranger_part.id}/exercises"
        expect(response).to have_http_status(:forbidden)
      end
    end

    describe "GET /api/v1/users/:account_id/exercises/:id/volume" do
      let(:exercise) { create(:exercise, user: user, body_part: body_part) }

      it "種目別の日別ボリュームを返すこと" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-10")
        create(:workout_set, workout_log: log, weight: 80.0, reps: 10)
        create(:workout_set, workout_log: log, weight: 60.0, reps: 12)

        get "/api/v1/users/#{user.account_id}/exercises/#{exercise.id}/volume"

        expect(response).to have_http_status(:ok)
        entry = response.parsed_body.find { |e| e["date"] == "2026-04-10" }
        expect(entry["volume"]).to eq(80.0 * 10 + 60.0 * 12)
      end

      context "フレンドの種目ボリュームを見る場合" do
        before { create(:friendship, requester: user, receiver: friend, status: "accepted") }

        it "フレンドの種目別ボリュームを返すこと" do
          friend_exercise = create(:exercise, user: friend)
          log = create(:workout_log, exercise: friend_exercise, date: "2026-04-10")
          create(:workout_set, workout_log: log, weight: 80.0, reps: 10)

          get "/api/v1/users/#{friend.account_id}/exercises/#{friend_exercise.id}/volume"

          expect(response).to have_http_status(:ok)
          entry = response.parsed_body.find { |e| e["date"] == "2026-04-10" }
          expect(entry["volume"]).to eq(80.0 * 10)
        end
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        get "/api/v1/users/#{user.account_id}/exercises/#{other_exercise.id}/volume"
        expect(response).to have_http_status(:not_found)
      end

      it "フレンドでないユーザーは403を返すこと" do
        stranger = create(:user)
        stranger_exercise = create(:exercise, user: stranger)
        get "/api/v1/users/#{stranger.account_id}/exercises/#{stranger_exercise.id}/volume"
        expect(response).to have_http_status(:forbidden)
      end
    end

    describe "GET /api/v1/users/:account_id/exercises/:id/one_rm_history" do
      let(:exercise) { create(:exercise, user: user, body_part: body_part) }

      it "種目別の日別1RM履歴を返すこと" do
        log = create(:workout_log, exercise: exercise, date: "2026-04-10")
        create(:workout_set, workout_log: log, weight: 100.0, reps: 5)

        get "/api/v1/users/#{user.account_id}/exercises/#{exercise.id}/one_rm_history"

        expect(response).to have_http_status(:ok)
        entry = response.parsed_body.find { |e| e["date"] == "2026-04-10" }
        expect(entry["one_rm"]).to eq(100.0 * (1 + 5 / 30.0))
      end

      context "フレンドの1RM履歴を見る場合" do
        before { create(:friendship, requester: user, receiver: friend, status: "accepted") }

        it "フレンドの種目別1RM履歴を返すこと" do
          friend_exercise = create(:exercise, user: friend)
          log = create(:workout_log, exercise: friend_exercise, date: "2026-04-10")
          create(:workout_set, workout_log: log, weight: 100.0, reps: 5)

          get "/api/v1/users/#{friend.account_id}/exercises/#{friend_exercise.id}/one_rm_history"

          expect(response).to have_http_status(:ok)
          entry = response.parsed_body.find { |e| e["date"] == "2026-04-10" }
          expect(entry["one_rm"]).to eq(100.0 * (1 + 5 / 30.0))
        end
      end

      it "他ユーザーの種目は404を返すこと" do
        other_exercise = create(:exercise)
        get "/api/v1/users/#{user.account_id}/exercises/#{other_exercise.id}/one_rm_history"
        expect(response).to have_http_status(:not_found)
      end

      it "フレンドでないユーザーは403を返すこと" do
        stranger = create(:user)
        stranger_exercise = create(:exercise, user: stranger)
        get "/api/v1/users/#{stranger.account_id}/exercises/#{stranger_exercise.id}/one_rm_history"
        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
