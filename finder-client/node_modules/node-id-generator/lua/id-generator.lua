local key_prefix = KEYS[1]

local millitimestamp = tonumber(ARGV[1])
local interval = tonumber(ARGV[2]) or 1
local offset = tonumber(ARGV[3]) or 0
local max_sequence = tonumber(ARGV[4]) or 4095
local num_ids = tonumber(ARGV[5]) or 1

local time_key = key_prefix .. '-time'
local sequence_key = key_prefix .. '-seq'
local global_logical_shard_id_key = 'global-logical-shard-id-default'

--[[
add timezone offset to timestamp
--]]
local now_time_interval = tostring(math.floor((millitimestamp + offset) / interval))

local last_time = redis.call('GET', time_key) or 0;
local last_time_interval = tostring(math.floor((last_time + offset) / interval))

--[[
check system clock
optimistic lock, catch error and repeat the operation
--]]
if last_time_interval > now_time_interval then
  redis.log(redis.LOG_NOTICE, 'IdGenerator: System clock turned back, reject to generate new id, please retry in caller')
  return redis.error_reply('IdGenerator: System clock turned back, reject to generate new id, please retry in caller')
end

--[[
reset sequence and lock
--]]
if last_time_interval < now_time_interval then
  redis.call('SET', sequence_key, '0')
  redis.call('SET', time_key, millitimestamp)
end

--[[
Increment by a set number, this can
--]]
local end_sequence = redis.call('INCRBY', sequence_key, num_ids)
local start_sequence = end_sequence - num_ids + 1

--[[
use logical shard id first, if it is not defined, then use the global shard id
--]]
local logical_shard_id = tonumber(redis.call('GET', global_logical_shard_id_key)) or 0

local hit_top = 0

if end_sequence > max_sequence then
  if start_sequence >= max_sequence then
    redis.log(redis.LOG_NOTICE, 'IdGenerator: Cannot generate id, hit the top')
    return redis.error_reply('IdGenerator: Cannot generate id, hit the top')
  end
  end_sequence = max_sequence
  hit_top = 1
end

return {
  start_sequence,
  end_sequence,
  hit_top,
  logical_shard_id,
  millitimestamp,
  offset
}
