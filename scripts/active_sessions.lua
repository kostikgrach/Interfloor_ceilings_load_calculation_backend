-- Активные сессии в Redis.
-- Ключ сессии: session:<uuid> -> <user_id>
-- Результат: строки вида "7 3541", где 3541 — оставшееся время жизни в секундах.
-- ARGV[1] — необязательный шаблон ключей, по умолчанию session:*.

local result = {}
local pattern = ARGV[1] or 'session:*'
local keys = redis.call('KEYS', pattern)

for i = 1, #keys do
    local user_id = redis.call('GET', keys[i])

    if user_id then
        local ttl = redis.call('TTL', keys[i])

        if ttl >= 0 then
            table.insert(result, user_id .. ' ' .. ttl)
        end
    end
end

table.sort(result)
return result
