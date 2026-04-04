require "rails_helper"

RSpec.describe Friendship, type: :model do
  describe "バリデーション" do
    it "requester, receiver, statusがあれば有効であること" do
      friendship = build(:friendship)
      expect(friendship).to be_valid
    end

    it "statusがpendingでもacceptedでもなければ無効であること" do
      friendship = build(:friendship, status: "invalid")
      expect(friendship).not_to be_valid
      expect(friendship.errors[:status]).to include("is not included in the list")
    end

    it "同じrequester/receiver間の重複申請は無効であること" do
      friendship = create(:friendship)
      duplicate = build(:friendship, requester: friendship.requester, receiver: friendship.receiver)
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:requester_id]).to include("has already been taken")
    end

    it "自分自身へのフレンド申請は無効であること" do
      user = create(:user)
      friendship = build(:friendship, requester: user, receiver: user)
      expect(friendship).not_to be_valid
      expect(friendship.errors[:base]).to include("自分自身にフレンド申請はできません")
    end

    it "逆方向の申請が存在する場合は無効であること" do
      user_a = create(:user)
      user_b = create(:user)
      create(:friendship, requester: user_a, receiver: user_b)
      reverse = build(:friendship, requester: user_b, receiver: user_a)
      expect(reverse).not_to be_valid
      expect(reverse.errors[:base]).to include("すでにフレンド関係または申請中です")
    end
  end
end
