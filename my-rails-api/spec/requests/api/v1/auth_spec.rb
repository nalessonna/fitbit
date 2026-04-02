require "rails_helper"

RSpec.describe "Api::V1::Sessions", type: :request do
  describe "GET /api/v1/auth/google/callback" do
    context "新規ユーザーの場合" do
      it "ユーザーを作成してCookieをセットし/workoutにリダイレクトすること" do
        expect {
          get "/api/v1/auth/google/callback"
        }.to change(User, :count).by(1)

        expect(response).to redirect_to("#{ENV.fetch("FRONTEND_URL", "http://localhost:3000")}/workout")
        expect(response.cookies["auth_token"]).to be_present
      end
    end

    context "既存ユーザーの場合" do
      it "新規ユーザーを作成せずCookieをセットし/workoutにリダイレクトすること" do
        create(:user, google_uid: "123456789")

        expect {
          get "/api/v1/auth/google/callback"
        }.not_to change(User, :count)

        expect(response).to redirect_to("#{ENV.fetch("FRONTEND_URL", "http://localhost:3000")}/workout")
        expect(response.cookies["auth_token"]).to be_present
      end
    end
  end

  describe "DELETE /api/v1/sessions" do
    it "auth_token Cookieを削除して204を返すこと" do
      user = create(:user)
      cookies[:auth_token] = JwtService.encode(user.id)

      delete "/api/v1/sessions"

      expect(response).to have_http_status(:no_content)
      expect(response.cookies["auth_token"]).to be_nil
    end
  end
end
