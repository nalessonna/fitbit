class JwtService
  SECRET    = ENV.fetch("SECRET_KEY_BASE", "fallback_secret")
  ALGORITHM = "HS256"

  def self.encode(user_id)
    payload = { sub: user_id, exp: 24.hours.from_now.to_i }
    JWT.encode(payload, SECRET, ALGORITHM)
  end

  def self.decode(token)
    decoded = JWT.decode(token, SECRET, true, { algorithm: ALGORITHM })
    decoded.first
  rescue JWT::ExpiredSignature, JWT::DecodeError
    nil
  end
end
