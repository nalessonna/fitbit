class Api::V1::Me::ExercisesController < ApplicationController
  before_action :set_body_part, only: [ :create ]
  before_action :set_exercise,  only: [ :update, :destroy ]

  def create
    exercise = @body_part.exercises.build(exercise_params.merge(user: current_user))
    if exercise.save
      render json: exercise_json(exercise), status: :created
    else
      render json: { errors: exercise.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    if @exercise.update(exercise_params)
      render json: exercise_json(@exercise)
    else
      render json: { errors: @exercise.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    @exercise.destroy
    head :no_content
  end

  private

  def set_body_part
    @body_part = current_user.body_parts.find_by(id: params[:body_part_id])
    render json: { error: "Not found" }, status: :not_found if @body_part.nil?
  end

  def set_exercise
    @exercise = current_user.exercises.find_by(id: params[:id])
    render json: { error: "Not found" }, status: :not_found if @exercise.nil?
  end

  def exercise_params
    params.require(:exercise).permit(:name, :body_part_id)
  end

  def exercise_json(exercise)
    {
      id:           exercise.id,
      name:         exercise.name,
      body_part_id: exercise.body_part_id,
      body_part:    exercise.body_part.name
    }
  end
end
