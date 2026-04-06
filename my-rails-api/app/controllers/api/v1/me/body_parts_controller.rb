class Api::V1::Me::BodyPartsController < ApplicationController
  before_action :set_body_part, only: [ :update, :destroy ]

  def create
    body_part = current_user.body_parts.build(body_part_params)
    if body_part.save
      render json: body_part_json(body_part), status: :created
    else
      render json: { errors: body_part.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @body_part.update(body_part_params)
      render json: body_part_json(@body_part)
    else
      render json: { errors: @body_part.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    if @body_part.destroy
      head :no_content
    else
      render json: { errors: @body_part.errors.full_messages }, status: :unprocessable_content
    end
  end

  private

  def set_body_part
    @body_part = current_user.body_parts.find_by(id: params[:id])
    render json: { error: "Not found" }, status: :not_found if @body_part.nil?
  end

  def body_part_params
    params.require(:body_part).permit(:name)
  end

  def body_part_json(body_part)
    { id: body_part.id, name: body_part.name }
  end
end
