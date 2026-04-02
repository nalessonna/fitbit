class Api::V1::SessionsController < ApplicationController
  skip_before_action :authenticate_user!, only: [ :create ]

  # GET /api/v1/auth/google/callback
  def create
    auth = request.env["omniauth.auth"]
    user = User.find_or_initialize_by(google_uid: auth.uid)
    if user.new_record?
      user.assign_attributes(name: auth.info.name, avatar_url: auth.info.image)
      user.save!
    end

    token = JwtService.encode(user.id)
    response.set_cookie(
      :auth_token,
      value:     token,
      httponly:  true,
      secure:    Rails.env.production?,
      same_site: :lax,
      max_age:   86400,
      path:      "/"
    )

    redirect_to "#{ENV.fetch("FRONTEND_URL", "http://localhost:3000")}/workout",
      allow_other_host: true
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  # DELETE /api/v1/sessions
  def destroy
    response.delete_cookie(:auth_token, path: "/")
    head :no_content
  end
end
