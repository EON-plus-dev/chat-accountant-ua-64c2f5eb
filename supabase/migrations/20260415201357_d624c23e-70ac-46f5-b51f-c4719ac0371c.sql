
DROP POLICY "Anyone can insert ai queries" ON public.ai_chat_queries;

CREATE POLICY "Validated insert ai queries"
  ON public.ai_chat_queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(question) >= 10 AND
    length(ai_answer) >= 10 AND
    length(audience) <= 50
  );
