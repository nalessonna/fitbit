class Friendship < ApplicationRecord
  belongs_to :requester, class_name: "User"
  belongs_to :receiver,  class_name: "User"

  validates :status, inclusion: { in: %w[pending accepted] }
  validates :requester_id, uniqueness: { scope: :receiver_id }
  validate :cannot_friend_self
  validate :no_reverse_friendship

  private

  def cannot_friend_self
    errors.add(:base, "自分自身にフレンド申請はできません") if requester_id == receiver_id
  end

  def no_reverse_friendship
    return unless requester_id && receiver_id
    if Friendship.where(requester_id: receiver_id, receiver_id: requester_id).exists?
      errors.add(:base, "すでにフレンド関係または申請中です")
    end
  end
end
