require "rails_helper"

RSpec.describe JwtService do
  let(:user_id) { 1 }

  describe ".encode" do
    it "ユーザーIDからJWTを生成できること" do
      token = JwtService.encode(user_id)
      expect(token).to be_a(String)
      expect(token.split(".").length).to eq(3)
    end
  end

  describe ".decode" do
    it "有効なトークンからuser_idをデコードできること" do
      token = JwtService.encode(user_id)
      payload = JwtService.decode(token)
      expect(payload["sub"]).to eq(user_id)
    end

    it "期限切れトークンはnilを返すこと" do
      token = JWT.encode(
        { sub: user_id, exp: 1.hour.ago.to_i },
        ENV.fetch("SECRET_KEY_BASE", "test_secret"),
        "HS256"
      )
      expect(JwtService.decode(token)).to be_nil
    end

    it "不正なトークンはnilを返すこと" do
      expect(JwtService.decode("invalid.token.here")).to be_nil
    end
  end
end
