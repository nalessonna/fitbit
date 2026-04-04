class Api::V1::Me::BodyPartsController < ApplicationController
  include PeriodFilterable

  before_action :set_body_part, only: [ :update, :destroy, :volume ]

  def index
    body_parts = current_user.body_parts.order(:name)
    render json: body_parts.map { |bp| body_part_json(bp) }
  end

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

  def volume
    sets = filter_by_period(
      WorkoutSet.joins(workout_log: :exercise).where(exercises: { body_part_id: @body_part.id }),
      column: "workout_logs.date"
    )

    result = sets
      .group("workout_logs.date")
      .sum("workout_sets.weight * workout_sets.reps")
      .map { |date, vol| { date: date.to_s, volume: vol.to_f } }
      .sort_by { |e| e[:date] }

    render json: result
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
    @body_part = current_user.body_parts.find_by!(id: params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Not found" }, status: :not_found
  end

  def body_part_params
    params.require(:body_part).permit(:name)
  end

  def body_part_json(body_part)
    {
      id:   body_part.id,
      name: body_part.name
    }
  end
end
