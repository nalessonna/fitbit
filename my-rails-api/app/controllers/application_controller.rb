class ApplicationController < ActionController::API
  include ActionController::Cookies

  before_action :authenticate_user!

  private

  def authenticate_user!
    token = cookies[:auth_token]
    payload = JwtService.decode(token)
    return render json: { error: "Unauthorized" }, status: :unauthorized unless payload

    @current_user = User.find_by(id: payload["sub"])
    render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
  end

  def current_user = @current_user
end
