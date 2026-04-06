class Api::V1::Users::BaseController < ApplicationController
  before_action :set_target_user

  private

  def set_target_user
    target = User.find_by_account_id(params[:account_id])
    return render json: { error: "Not found" }, status: :not_found if target.nil?

    if target.id == current_user.id
      @target_user = current_user
    elsif friends?(current_user, target)
      @target_user = target
    else
      render json: { error: "Forbidden" }, status: :forbidden
    end
  end

  def friends?(user_a, user_b)
    Friendship.where(status: "accepted")
      .where(
        "(requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?)",
        user_a.id, user_b.id, user_b.id, user_a.id
      ).exists?
  end
end
